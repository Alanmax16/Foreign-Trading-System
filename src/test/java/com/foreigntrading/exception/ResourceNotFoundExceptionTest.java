package com.foreigntrading.exception;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ResourceNotFoundExceptionTest {

    @Test
    void constructor_WithMessage_SetsMessage() {
        // Arrange
        String message = "Resource not found";

        // Act
        ResourceNotFoundException exception = new ResourceNotFoundException(message);

        // Assert
        assertEquals(message, exception.getMessage());
    }

    @Test
    void constructor_WithMessageAndCause_SetsMessageAndCause() {
        // Arrange
        String message = "Resource not found";
        Throwable cause = new RuntimeException("Original error");

        // Act
        ResourceNotFoundException exception = new ResourceNotFoundException(message, cause);

        // Assert
        assertEquals(message, exception.getMessage());
        assertEquals(cause, exception.getCause());
    }

    @Test
    void exception_IsRuntimeException() {
        // Act
        ResourceNotFoundException exception = new ResourceNotFoundException("Test");

        // Assert
        assertTrue(exception instanceof RuntimeException);
    }
} 