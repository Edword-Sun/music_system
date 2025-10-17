package model

import (
	"gorm.io/gorm"
	"time"
)

type User struct {
	ID       string `gorm:"primarykey type:text;default:(UUID())" json:"id"`
	Name     string `gorm:"type:text" json:"name"`
	Account  string `gorm:"type:text" json:"account"`
	Password string `gorm:"type:text" json:"password"`
	Email    string `gorm:"type:text" json:"email"`

	Auth int `gorm:"type:integer" json:"auth"` // 0: 超级管理员 1: 普通管理员 2: 超级用户 3: 普通用户...

	CreateTime time.Time `gorm:"type:DATETIME with time zone;not null" json:"create_time"`
	UpdateTime time.Time `gorm:"type:DATETIME with time zone;not null" json:"update_time"`
}

func (m *User) TableName() string {
	return "user"
}

func (m *User) BeforeCreate(tx *gorm.DB) (err error) {
	m.CreateTime = time.Now()
	m.UpdateTime = time.Now()
	return nil
}

func (m *User) BeforeUpdate(tx *gorm.DB) (err error) {
	m.UpdateTime = time.Now()
	return nil
}
