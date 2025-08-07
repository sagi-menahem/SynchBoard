package io.github.sagimenahem.synchboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import io.github.sagimenahem.synchboard.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
}
