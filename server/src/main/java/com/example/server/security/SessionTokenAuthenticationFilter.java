package com.example.server.security;

import com.example.server.entity.SessionEntity;
import com.example.server.repository.SessionRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

@Component
public class SessionTokenAuthenticationFilter extends OncePerRequestFilter {

    private final SessionRepository sessionRepository;

    public SessionTokenAuthenticationFilter(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String rawToken = authHeader.substring(7).trim();
            if (!rawToken.isEmpty()) {
                byte[] tokenHash = sha256(rawToken);
                Optional<SessionEntity> sessionOpt = sessionRepository.findByTokenHashAndRevokedAtIsNull(tokenHash);

                if (sessionOpt.isPresent()) {
                    SessionEntity session = sessionOpt.get();
                    if (session.getExpiresAt().isAfter(OffsetDateTime.now(ZoneOffset.UTC))) {
                        CustomUserDetails userDetails = new CustomUserDetails(session.getUser());
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        // Cập nhật last_seen_at có giãn cách (> 5 phút / 300s) để tránh bão ghi CSDL
                        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
                        if (session.getLastSeenAt() == null || session.getLastSeenAt().isBefore(now.minusSeconds(300))) {
                            session.setLastSeenAt(now);
                            sessionRepository.save(session);
                        }
                    }
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private byte[] sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return digest.digest(input.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not supported", e);
        }
    }
}
