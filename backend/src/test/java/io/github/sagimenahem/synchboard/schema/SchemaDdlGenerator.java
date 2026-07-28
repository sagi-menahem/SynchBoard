package io.github.sagimenahem.synchboard.schema;

import io.github.sagimenahem.synchboard.entity.ActionHistory;
import io.github.sagimenahem.synchboard.entity.BoardObject;
import io.github.sagimenahem.synchboard.entity.GroupBoard;
import io.github.sagimenahem.synchboard.entity.GroupMember;
import io.github.sagimenahem.synchboard.entity.Message;
import io.github.sagimenahem.synchboard.entity.PendingRegistration;
import io.github.sagimenahem.synchboard.entity.User;
import java.util.List;
import java.util.stream.Collectors;
import org.hibernate.boot.Metadata;
import org.hibernate.boot.MetadataSources;
import org.hibernate.boot.registry.StandardServiceRegistry;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.cfg.AvailableSettings;
import org.hibernate.dialect.PostgreSQLDialect;
import org.hibernate.tool.schema.internal.SchemaCreatorImpl;

/**
 * Derives PostgreSQL DDL from the JPA entity mappings, with no database connection.
 *
 * <p>
 * This exists so the Flyway baseline is not hand-copied and cannot silently drift. The DDL comes
 * from the same metadata Hibernate itself uses, and {@code SchemaBaselineTest} asserts the committed
 * baseline migration still matches — so changing an entity without writing a migration fails the
 * build instead of diverging quietly.
 * </p>
 */
public final class SchemaDdlGenerator {

    /**
     * Every {@code @Entity} in the application. An entity missing from this list would let
     * {@code SchemaBaselineTest} pass while the real schema drifts, so keep it exhaustive.
     */
    private static final List<Class<?>> ENTITIES = List.of(
        ActionHistory.class,
        BoardObject.class,
        GroupBoard.class,
        GroupMember.class,
        Message.class,
        PendingRegistration.class,
        User.class
    );

    private SchemaDdlGenerator() {}

    /**
     * Generates the {@code CREATE} statements for the full entity model.
     *
     * @return normalized DDL, one statement per line, ordered deterministically
     */
    public static String generate() {
        StandardServiceRegistry registry = new StandardServiceRegistryBuilder()
            .applySetting(AvailableSettings.DIALECT, PostgreSQLDialect.class.getName())
            // Metadata-only: no JDBC connection is opened at any point.
            .applySetting(AvailableSettings.HBM2DDL_AUTO, "none")
            .build();

        try {
            MetadataSources sources = new MetadataSources(registry);
            ENTITIES.forEach(sources::addAnnotatedClass);
            Metadata metadata = sources.buildMetadata();

            List<String> commands = new SchemaCreatorImpl(registry).generateCreationCommands(metadata, false);
            // Hibernate returns statements without terminators; normalize() splits on ';'.
            return normalize(commands.stream().collect(Collectors.joining(";\n", "", ";")));
        } finally {
            StandardServiceRegistryBuilder.destroy(registry);
        }
    }

    /**
     * Normalizes DDL for stable comparison.
     *
     * <p>
     * Comparison is per statement, not per line, so the committed migration can be pretty-printed
     * across many lines while Hibernate emits one statement per line. Comments are dropped,
     * whitespace inside a statement is collapsed, and statements are sorted so Hibernate's
     * non-deterministic emission order cannot cause a spurious mismatch.
     * </p>
     *
     * @param ddl raw DDL, in either layout
     * @return normalized, sorted, one statement per line
     */
    public static String normalize(String ddl) {
        String withoutComments = ddl
            .lines()
            .filter((line) -> !line.trim().startsWith("--"))
            .collect(Collectors.joining("\n"));

        return java.util.Arrays.stream(withoutComments.split(";"))
            .map((statement) -> statement.replaceAll("\\s+", " ").trim())
            .filter((statement) -> !statement.isEmpty())
            // Collapse "( " and " )" so pretty-printed and inline forms agree.
            .map((statement) -> statement.replace("( ", "(").replace(" )", ")"))
            .map((statement) -> statement + ";")
            .sorted()
            .collect(Collectors.joining("\n"));
    }
}
