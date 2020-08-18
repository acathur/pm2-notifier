const axios = require('axios')

class FeishuNotifier {
	static async send(payload, config) {
		const { access_token } = config

		const { data } = await axios({
			method: 'POST',
			url: `https://open.feishu.cn/open-apis/bot/hook/${access_token}`,
			data: payload
		})

		if (data && data.error) {
			throw new Error(data.error)
		}
	}
}

module.exports = FeishuNotifier
