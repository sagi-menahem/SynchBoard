// File: backend/src/main/java/com/synchboard/backend/BackendApplication.java
package com.synchboard.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * The main entry point for the SynchBoard Spring Boot application.
 */
@SpringBootApplication
public class BackendApplication {

	/**
	 * The main method which serves as the entry point for the application.
	 * 
	 * @param args command line arguments.
	 */
	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}