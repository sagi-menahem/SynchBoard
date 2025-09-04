package io.github.sagimenahem.synchboard.constants;

/**
 * Action constants defining the types of operations performed on board objects. These constants are
 * used throughout the application for action tracking, audit trails, and undo/redo functionality.
 * They represent the fundamental operations that can be performed on canvas objects in the
 * collaborative whiteboard system.
 * 
 * @author Sagi Menahem
 */
public final class ActionConstants {

    private ActionConstants() {}

    // Canvas Object Operation Types

    /**
     * Action type constant for adding a new object to the canvas. Used when users create new
     * shapes, lines, or other drawable elements.
     */
    public static final String OBJECT_ADD_ACTION = "OBJECT_ADD";

    /**
     * Action type constant for deleting an existing object from the canvas. Used when users remove
     * shapes, lines, or other drawable elements.
     */
    public static final String OBJECT_DELETE_ACTION = "OBJECT_DELETE";

    /**
     * Action type constant for updating properties of an existing canvas object. Used when users
     * modify position, size, color, or other attributes of drawable elements.
     */
    public static final String OBJECT_UPDATE_ACTION = "OBJECT_UPDATE";
}
