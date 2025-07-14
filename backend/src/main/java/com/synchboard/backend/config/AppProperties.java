// File: backend/src/main/java/com/synchboard/backend/config/AppProperties.java
package com.synchboard.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Jwt jwt = new Jwt();
    private final Stomp stomp = new Stomp();

    public Jwt getJwt() {
        return jwt;
    }

    public Stomp getStomp() {
        return stomp;
    }

    public static class Jwt {
        private String secretKey;

        public String getSecretKey() {
            return secretKey;
        }

        public void setSecretKey(String secretKey) {
            this.secretKey = secretKey;
        }
    }

    public static class Stomp {
        private String brokerHost;
        private int brokerPort;

        public String getBrokerHost() {
            return brokerHost;
        }

        public void setBrokerHost(String brokerHost) {
            this.brokerHost = brokerHost;
        }

        public int getBrokerPort() {
            return brokerPort;
        }

        public void setBrokerPort(int brokerPort) {
            this.brokerPort = brokerPort;
        }
    }
}