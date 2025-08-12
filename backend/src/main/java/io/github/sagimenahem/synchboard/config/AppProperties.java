package io.github.sagimenahem.synchboard.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Jwt jwt = new Jwt();
    private final Stomp stomp = new Stomp();
    private final Upload upload = new Upload();

    public Jwt getJwt() {
        return jwt;
    }

    public Stomp getStomp() {
        return stomp;
    }

    public Upload getUpload() {
        return upload;
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

    public static class Upload {
        private String dir;

        public String getDir() {
            return dir;
        }

        public void setDir(String dir) {
            this.dir = dir;
        }
    }
}
