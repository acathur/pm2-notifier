const { createHmac } = require('crypto')
const axios = require('axios')

class DingTalkNotifier {
	static generateSignature(timestamp, secret) {
		return createHmac('sha256', secret).update(timestamp + '\n' + secret).digest('base64')
	}

	static async send(payload, config) {
		const { access_token, secret } = config
		const timestamp = Date.now()
		const sign = this.generateSignature(timestamp, secret)

		const { data } = await axios({
			method: 'POST',
			url: 'https://oapi.dingtalk.com/robot/send',
			params: {
				access_token,
				timestamp,
				sign
			},
			data: payload
		})

		if (data && data.errcode) {
			throw new Error(`[${data.errcode}] ${data.errmsg}`)
		}
	}
}

module.exports = DingTalkNotifier
