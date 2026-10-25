package com.example.server.socket.core;

import com.example.server.socket.RoomEventBus;
import com.example.server.socket.protocol.PacketFrame;
import com.example.server.socket.protocol.PacketFramingDecoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.SmartLifecycle;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.StandardSocketOptions;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Máy chủ Socket Java NIO cài đặt theo mô hình Doug Lea Classic Reactor Pattern.
 * - 1 Luồng Reactor duy nhất quản lý Selector non-blocking (OP_ACCEPT, OP_READ).
 * - 1 Worker ThreadPool xử lý giải mã nghiệp vụ và chuyển giao cho RoomEventBus.
 */
@Component
public class NioClassicReactorServer implements SmartLifecycle, Runnable {

    private static final Logger log = LoggerFactory.getLogger(NioClassicReactorServer.class);

    private final int port;
    private final RoomEventBus roomEventBus;
    private final PacketFramingDecoder decoder;

    private Selector selector;
    private ServerSocketChannel serverChannel;
    private Thread reactorThread;
    private ExecutorService workerPool;

    private volatile boolean isRunning = false;

    public NioClassicReactorServer(
            @Value("${socket.tcp.port:9090}") int port,
            RoomEventBus roomEventBus
    ) {
        this.port = port;
        this.roomEventBus = roomEventBus;
        this.decoder = new PacketFramingDecoder();
    }

    @Override
    public void start() {
        if (isRunning) return;

        try {
            selector = Selector.open();
            serverChannel = ServerSocketChannel.open();
            serverChannel.configureBlocking(false);
            serverChannel.setOption(StandardSocketOptions.SO_REUSEADDR, true);
            serverChannel.bind(new InetSocketAddress(port));
            serverChannel.register(selector, SelectionKey.OP_ACCEPT);

            workerPool = Executors.newFixedThreadPool(
                    Math.max(4, Runtime.getRuntime().availableProcessors() * 2),
                    r -> {
                        Thread t = new Thread(r, "nio-worker-" + UUID.randomUUID().toString().substring(0, 4));
                        t.setDaemon(true);
                        return t;
                    }
            );

            isRunning = true;
            reactorThread = new Thread(this, "nio-reactor-thread");
            reactorThread.start();

            log.info("===============================================================");
            log.info(">>> [NIO Classic Reactor] Server started on port {} (Non-blocking)", port);
            log.info("===============================================================");
        } catch (IOException e) {
            log.error("Failed to start NIO Classic Reactor Server on port {}", port, e);
            throw new IllegalStateException("NIO Server startup failed", e);
        }
    }

    @Override
    public void run() {
        while (isRunning && !Thread.currentThread().isInterrupted()) {
            try {
                int readyChannels = selector.select(500);
                if (readyChannels == 0) continue;

                Set<SelectionKey> selectedKeys = selector.selectedKeys();
                Iterator<SelectionKey> keyIterator = selectedKeys.iterator();

                while (keyIterator.hasNext()) {
                    SelectionKey key = keyIterator.next();
                    keyIterator.remove();

                    if (!key.isValid()) continue;

                    if (key.isAcceptable()) {
                        handleAccept(key);
                    } else if (key.isReadable()) {
                        handleRead(key);
                    }
                }
            } catch (IOException e) {
                if (isRunning) {
                    log.error("Exception in Reactor Event Loop", e);
                }
            }
        }
    }

    private void handleAccept(SelectionKey key) throws IOException {
        ServerSocketChannel ssc = (ServerSocketChannel) key.channel();
        SocketChannel sc = ssc.accept();
        if (sc != null) {
            sc.configureBlocking(false);
            ClientSession session = new ClientSession(sc, UUID.randomUUID().toString());
            sc.register(selector, SelectionKey.OP_READ, session);
            log.info("[NIO Reactor] Accepted connection from {}, Session ID: {}",
                    sc.getRemoteAddress(), session.getSessionId());
        }
    }

    private void handleRead(SelectionKey key) {
        SocketChannel sc = (SocketChannel) key.channel();
        ClientSession session = (ClientSession) key.attachment();
        ByteBuffer buffer = session.getAccumulationBuffer();

        int bytesRead;
        try {
            bytesRead = sc.read(buffer);
        } catch (IOException e) {
            bytesRead = -1;
        }

        if (bytesRead == -1) {
            log.info("[NIO Reactor] Client disconnected: {}", session.getSessionId());
            key.cancel();
            try {
                sc.close();
            } catch (IOException ignored) {}
            workerPool.submit(() -> roomEventBus.handleTcpDisconnect(session));
            return;
        }

        if (bytesRead > 0) {
            buffer.flip();
            List<PacketFrame> frames;
            try {
                frames = decoder.decode(buffer);
            } catch (IllegalArgumentException e) {
                log.warn("[NIO Reactor] Protocol violation from {}: {}. Closing channel.",
                        session.getSessionId(), e.getMessage());
                key.cancel();
                try {
                    sc.close();
                } catch (IOException ignored) {}
                workerPool.submit(() -> roomEventBus.handleTcpDisconnect(session));
                return;
            }

            for (PacketFrame frame : frames) {
                workerPool.submit(() -> roomEventBus.handleTcpFrame(session, frame));
            }
        }
    }

    @Override
    public void stop() {
        if (!isRunning) return;
        isRunning = false;

        log.info("Stopping NIO Classic Reactor Server...");
        try {
            if (selector != null && selector.isOpen()) {
                selector.wakeup();
                selector.close();
            }
            if (serverChannel != null && serverChannel.isOpen()) {
                serverChannel.close();
            }
            if (workerPool != null) {
                workerPool.shutdown();
            }
            if (reactorThread != null) {
                reactorThread.interrupt();
            }
        } catch (IOException e) {
            log.error("Error closing NIO server components", e);
        }
    }

    @Override
    public boolean isRunning() {
        return isRunning;
    }

    public int getPort() {
        return port;
    }
}
