package model

import (
	"time"

	"gorm.io/gorm"
)

type Group struct {
	ID   string `gorm:"primarykey type:text; default:(UUID())" json:"id"`
	Name string `gorm:"type:text" json:"name"`
	// Content 存储 JSON 格式的音乐 ID 列表，例如 ["id1", "id2"]
	// 进阶笔记：GORM 其实支持自动序列化，只需要写成：
	// Content []string `gorm:"type:json;serializer:json" json:"content"`
	// 这样你就不用手动调用 json.Marshal/Unmarshal 了。
	// 但既然你想多练手，我们现在把它定义为原始 string，由你在业务逻辑中手动转换。
	// 数据库类型设置为 json，可以让数据库帮我们做格式校验。
	Content string `gorm:"type:json" json:"content"`
	UserID  string `gorm:"type:varchar(255);index" json:"user_id"`

	CreateTime time.Time `gorm:"type:datetime; not null" json:"create_time"`
	UpdateTime time.Time `gorm:"type:datetime; not null" json:"update_time"`
}

func (g *Group) TableName() string {
	return "group"
}

func (g *Group) BeforeCreate(tx *gorm.DB) (err error) {
	g.CreateTime = time.Now()
	g.UpdateTime = time.Now()
	return nil
}

func (g *Group) BeforeUpdate(tx *gorm.DB) (err error) {
	g.UpdateTime = time.Now()
	return nil
}
