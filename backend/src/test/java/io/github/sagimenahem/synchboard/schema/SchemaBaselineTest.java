package io.github.sagimenahem.synchboard.schema;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Guards the Flyway baseline against silent drift.
 *
 * <p>
 * The schema is owned by the SQL under {@code db/migration}; the JPA entities are types only. That
 * only holds if the two actually agree, so this test regenerates the DDL from the entity mappings
 * and compares it to the committed baseline. Changing an entity without writing the corresponding
 * migration fails here rather than at deploy time.
 * </p>
 *
 * <p>
 * When a later migration legitimately changes the schema, this test needs the baseline plus those
 * migrations to describe the same end state — see {@link #migrationsAreForwardOnly()}.
 * </p>
 */
@DisplayName("Flyway baseline")
class SchemaBaselineTest {

    private static final Path MIGRATION_DIR = Path.of("src", "main", "resources", "db", "migration");
    private static final Path BASELINE = MIGRATION_DIR.resolve("V1__baseline_schema.sql");

    @Test
    @DisplayName("matches the DDL generated from the JPA entities")
    void baselineMatchesEntities() throws IOException {
        String committed = SchemaDdlGenerator.normalize(Files.readString(BASELINE, StandardCharsets.UTF_8));
        String generated = SchemaDdlGenerator.generate();

        assertThat(committed)
            .as(
                "%s is out of sync with the JPA entities. The entities changed without a migration, " +
                    "or the baseline was hand-edited. Regenerate and add a forward migration.",
                BASELINE
            )
            .isEqualTo(generated);
    }

    @Test
    @DisplayName("declares every entity table")
    void baselineCoversEveryTable() throws IOException {
        String baseline = Files.readString(BASELINE, StandardCharsets.UTF_8).toLowerCase();

        assertThat(
            List.of(
                "users",
                "group_boards",
                "group_members",
                "board_objects",
                "action_history",
                "messages",
                "pending_registrations"
            )
        ).allSatisfy((table) -> assertThat(baseline).contains("create table " + table + " ("));
    }

    @Test
    @DisplayName("contains only forward-only versioned migrations")
    void migrationsAreForwardOnly() throws IOException {
        try (var entries = Files.list(MIGRATION_DIR)) {
            List<String> names = entries
                .map((path) -> path.getFileName().toString())
                .sorted()
                .toList();

            assertThat(names).isNotEmpty();
            assertThat(names)
                .as("Flyway undo scripts (U*.sql) are not used: migrations are forward-only")
                .noneMatch((name) -> name.startsWith("U"));
            assertThat(names)
                .as("every migration must be a versioned V<n>__<name>.sql script")
                .allMatch((name) -> name.matches("V\\d+(\\.\\d+)*__[A-Za-z0-9_]+\\.sql"));
        }
    }
}
