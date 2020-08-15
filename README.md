# PM2 Notifier

## Supported Messaging Tools

- DingTalk (钉钉)

## Installation

```sh
pm2 install pm2-notifier
```

## Usage

### Config

| Option           | Type       | Required | Default                                             |
|------------------|------------|:--------:|-----------------------------------------------------|
| events           | `string[]` | no       | `['log:err', 'process:exception', 'process:event']` |
| polling          | `number`   | no       | `10000` (ms)                                        |
| max_polling_time | `number`   | no       | `60000` (ms)                                        |
| dingtalk         | `object`   | yes      |                                                     |
| - access_token   | `string`   | yes      |                                                     |
| - secret         | `string`   | yes      |                                                     |
| - at_mobiles     | `string[]` | no       |                                                     |
| - at_all         | `boolean`  | no       | `false`                                             |
| - enable         | `boolean`  | no       | `true`                                              |

### Example

Add environment variables in your `ecosystem` file, here is an example write in `yaml` format.

```yaml
apps:
  - script: ./main.js
    name: app
    env_notifier:
      events:
        - log:err
        - process:event
      dingtalk:
        access_token: # your access token
        secret: # your secret
        at_all: true
```

Now, start your processes with `pm2 start ecosystem.config.yml`.

## License

[MIT](https://github.com/denodep/dep/blob/master/LICENSE)

Copyright (c) 2020, Acathur
