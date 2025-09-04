package io.github.sagimenahem.synchboard.repository;

import io.github.sagimenahem.synchboard.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository interface for User entity operations. Provides CRUD operations and
 * query methods for user account management. Uses email as the primary key for user identification.
 * 
 * @author Sagi Menahem
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {
}
