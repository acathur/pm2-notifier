const pm2 = require('pm2')
const os = require('os')
const { createHash } = require('crypto')
const pkg = require('./package.json')
const DingTalkNotifier = require('./provider/dingtalk')

const ALLOWED_EVENTS = [
	// 'log:out',
	'log:err',
	'process:exception',
	'process:event',
	'pm2:kill'
]

const DEF_CONFIG = {
	events: ['log:err', 'process:exception', 'process:event'],
	polling: 10000,
	max_polling_time: 60000
}

const queue = []
const cacheProcessConfig = {}
let timeout = null
let lastEventTime = null

const getConfig = (processName, config) => {
	if (!config) {
		return cacheProcessConfig[processName] || null
	}

	if (!config.dingtalk) {
		throw new Error('config -> dingtalk is required')
	}

	const merged = Object.assign({}, DEF_CONFIG, config)

	cacheProcessConfig[processName] = merged

	return merged
}

const sendDingTalkNotification = (data) => {
	const {
		config,
		title,
		content,
		hostname,
		time
	} = data

	DingTalkNotifier.send({
		msgtype: 'markdown',
		markdown: {
			title,
			text: `# ${title}\n${content ? '---\n```\n' + content + '\n```\n' : ''}---\n@${hostname}  \n@${time}`
		},
		at: {
			atMobiles: config.dingtalk.at_mobiles || undefined,
			isAtAll: config.dingtalk.at_all || false
		}
	}, config.dingtalk)
}

const processQueue = () => {
	const len = queue.length

	if (!len) {
		return
	}

	const exists = new Map()

	queue
		.filter((item) => !exists.has(item.id) && exists.set(item.id, 1))
		.forEach((item) => {
			sendDingTalkNotification(item)
		})

	queue.length = 0
}

const emitEvent = (event, bus) => {
	const [type, subtype] = event.split(':')

	bus.on(event, (data) => {
		const config = getConfig(data.process.name, data.process.env_notifier)

		if (!config ||
			config.enable == false ||
			data.manually ||
			data.process.name === pkg.name ||
			!config.events.includes(event) && !config.events.includes(`${event}:${data.event}`)) {
			return
		}

		const title = `[${data.process.name}] ${event}${data.event ? ':' + data.event : ''}`
		const time = new Date(data.at)
		const hostname = os.hostname()

		let content

		if (type === 'log') {
			content = data.data
		}
		else if (type === 'process' && subtype === 'exception') {
			content = JSON.stringify(data.data, null, 2)
		}

		queue.push({
			config,
			id: createHash('md5').update(title).digest('hex'),
			title,
			content,
			time,
			hostname
		})

		if (timeout) {
			clearTimeout(timeout)

			if (lastEventTime && Date.now() - lastEventTime >= config.max_polling_time) {
				processQueue()
			}
		}

		timeout = setTimeout(processQueue, config.polling)

		if (!lastEventTime) {
			lastEventTime = Date.now()
		}
	})
}

pm2.launchBus((err, bus) => {
	for (const event of ALLOWED_EVENTS) {
		emitEvent(event, bus)
	}
})
