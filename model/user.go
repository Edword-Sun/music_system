package model

import "time"

type User struct {
	ID          string    `gorm:"primarykey type:text;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"type:text" json:"name"`
	Account     string    `gorm:"type:text" json:"account"`
	Password    string    `gorm:"type:text" json:"password"`
	Email       string    `gorm:"type:text" json:"email"`
	CreatedTime time.Time `gorm:"type:timestamp with time zone;not null" json:"create_time"`
	UpdatedTime time.Time `gorm:"type:timestamp with time zone;not null" json:"update_time"`
}

func (m *User) TableName() string {
	return "user"
}
