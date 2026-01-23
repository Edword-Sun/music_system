package errors

import (
	"fmt"
)

// Code 表示错误码
type Code int

const (
	CodeInternal Code = iota + 1000
	CodeInvalidParam
	CodeNotFound
	CodeUnauthorized
)

// AppError 是自定义的应用错误
type AppError struct {
	Code    Code   `json:"code"`
	Message string `json:"message"`
	Err     error  `json:"-"`
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("[%d] %s: %v", e.Code, e.Message, e.Err)
	}
	return fmt.Sprintf("[%d] %s", e.Code, e.Message)
}

func (e *AppError) Unwrap() error {
	return e.Err
}

// New 创建一个新的 AppError
func New(code Code, message string, err error) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
		Err:     err,
	}
}

// Wrap 包装一个现有错误
func Wrap(code Code, message string, err error) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
		Err:     err,
	}
}
