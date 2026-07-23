# Contributing

Thank you for helping improve Chuangshi Engine.

## Before opening an issue

- Search existing issues.
- Reduce the problem to synthetic data.
- Do not upload proprietary game databases, personal information, copyrighted
  art, or secrets.

## Development

```bash
npm test
npm run check
npm run audit:example
```

Pull requests should:

- address one focused problem;
- include or update tests;
- preserve backward compatibility unless the change is clearly documented;
- explain changes to event semantics;
- avoid changing comparison, time, priority, weight, probability, or trigger
  behavior without an explicit design discussion.

## Security

Do not disclose vulnerabilities in a public issue. Follow
[SECURITY.md](SECURITY.md).
