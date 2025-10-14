package model

import "time"

type Music struct {
	ID          string `gorm:"primarykey type:text;default:gen_random_uuid()" json:"id"`
	Title       string `gorm:"type:text" json:"name"`        // 标题
	Description string `gorm:"type:text" json:"description"` // 详情
	Content     string `gorm:"type:text" json:"content"`     // 音乐本体
	PlayTime    string `gorm:"type:text" json:"play_time"`   // 音乐时长
	// singer
	SingerName string `gorm:"type:text" json:"singer_name"` // 音乐主唱人

	CreatedTime time.Time `gorm:"type:timestamp with time zone;not null" json:"create_time"`
	UpdatedTime time.Time `gorm:"type:timestamp with time zone;not null" json:"update_time"`
}

func (m *Music) TableName() string {
	return "music"
}
