package io.github.sagimenahem.synchboard.repository;

import io.github.sagimenahem.synchboard.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, String> {}
