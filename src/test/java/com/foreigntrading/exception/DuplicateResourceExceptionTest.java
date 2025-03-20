package com.foreigntrading.exception;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DuplicateResourceExceptionTest {

    @Test
    void constructor_WithMessage_SetsMessage() {
        // Arrange
        String message = "Resource already exists";

        // Act
        DuplicateResourceException exception = new DuplicateResourceException(message);

        // Assert
        assertEquals(message, exception.getMessage());
    }

    @Test
    void constructor_WithMessageAndCause_SetsMessageAndCause() {
        // Arrange
        String message = "Resource already exists";
        Throwable cause = new RuntimeException("Original error");

        // Act
        DuplicateResourceException exception = new DuplicateResourceException(message, cause);

        // Assert
        assertEquals(message, exception.getMessage());
        assertEquals(cause, exception.getCause());
    }

    @Test
    void exception_IsRuntimeException() {
        // Act
        DuplicateResourceException exception = new DuplicateResourceException("Test");

        // Assert
        assertTrue(exception instanceof RuntimeException);
    }
} 