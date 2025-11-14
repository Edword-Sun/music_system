package filter

type ListUser struct {
	IDs       []string `json:"ids"`
	Names     []string `json:"names"`
	Accounts  []string `json:"accounts"`
	Passwords []string `json:"passwords"`
	Emails    []string `json:"emails"`

	Offset    int   `json:"offset"`
	Limit     int   `json:"limit"`
	StartTime int64 `json:"start_time"`
	EndTime   int64 `json:"end_time"`
}

type FindUser struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Account  string `json:"account"`
	Password string `json:"password"`
	Email    string `json:"email"`

	Auth int `son:"auth"` // 0: 超级管理员 1: 普通管理员 2: 超级用户 3: 普通用户...
}
