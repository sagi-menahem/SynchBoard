package io.github.sagimenahem.synchboard.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties class for centralizing application settings. Binds external
 * configuration properties with "app" prefix to strongly-typed configuration objects for JWT,
 * STOMP, upload, security, and OAuth2 settings.
 *
 * @author Sagi Menahem
 */
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Jwt jwt = new Jwt();
    private final Stomp stomp = new Stomp();
    private final Upload upload = new Upload();
    private final Security security = new Security();
    private final Oauth2 oauth2 = new Oauth2();

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

    public Oauth2 getOauth2() {
        return oauth2;
    }

    public static class Jwt {

        private String secretKey;
        private int expirationHours = 24;

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

    public static class Oauth2 {

        private String frontendBaseUrl;

        public String getFrontendBaseUrl() {
            return frontendBaseUrl;
        }

        public void setFrontendBaseUrl(String frontendBaseUrl) {
            this.frontendBaseUrl = frontendBaseUrl;
        }
    }
}
