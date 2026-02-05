package model

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID         string    `gorm:"primarykey;type:text;default:(UUID())" json:"id"`
	Username   string    `gorm:"type:text;uniqueIndex;not null" json:"username"`
	Password   string    `gorm:"type:text" json:"-"`
	Nickname   string    `gorm:"type:text" json:"nickname"`
	Avatar     string    `gorm:"type:text" json:"avatar"`
	Role       string    `gorm:"type:text;default:'user'" json:"role"` // 'admin', 'user', 'guest'
	CreateTime time.Time `gorm:"type:DATETIME with time zone;not null" json:"create_time"`
	UpdateTime time.Time `gorm:"type:DATETIME with time zone;not null" json:"update_time"`
}

func (u *User) TableName() string {
	return "user"
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	u.CreateTime = time.Now()
	u.UpdateTime = time.Now()
	return nil
}

func (u *User) BeforeUpdate(tx *gorm.DB) (err error) {
	u.UpdateTime = time.Now()
	return nil
}
