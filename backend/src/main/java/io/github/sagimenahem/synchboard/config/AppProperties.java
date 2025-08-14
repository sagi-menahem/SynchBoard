package io.github.sagimenahem.synchboard.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Jwt jwt = new Jwt();
    private final Stomp stomp = new Stomp();
    private final Upload upload = new Upload();
    private final Security security = new Security();

    public Jwt getJwt() {
        return jwt;
    }

    public Stomp getStomp() {
        return stomp;
    }

    public Upload getUpload() {
        return upload;
    }

    public Security getSecurity() {
        return security;
    }

    public static class Jwt {
        private String secretKey;
        private int expirationHours = 24; // default 24 hours

        public String getSecretKey() {
            return secretKey;
        }

        public void setSecretKey(String secretKey) {
            this.secretKey = secretKey;
        }

        public int getExpirationHours() {
            return expirationHours;
        }

        public void setExpirationHours(int expirationHours) {
            this.expirationHours = expirationHours;
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

    public static class Upload {
        private String dir;

        public String getDir() {
            return dir;
        }

        public void setDir(String dir) {
            this.dir = dir;
        }
    }

    public static class Security {
        private String allowedOrigins;

        public String getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(String allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }
}
