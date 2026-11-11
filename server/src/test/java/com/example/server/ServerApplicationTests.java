package com.example.server;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "mooc.gateway.enabled=false")
class ServerApplicationTests {

	@Test
	void contextLoads() {
	}

}
