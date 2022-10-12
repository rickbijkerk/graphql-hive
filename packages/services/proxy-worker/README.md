## Hive Proxy Worker

Idea here is to have a proxy worker that can be used to make requests outside GraphQL Hive and without any access to the internal network.

### Example payload

```
POST /proxy-worker
JSON {
  "url": "https://example.com",
  "body": {
    "foo": "bar"
  }
}
```
