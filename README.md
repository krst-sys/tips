This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## BSD/Bzzoiro API environment

The "Proximos Jogos" and match analysis pages call the BSD/Bzzoiro Sports API
only from server routes under `/api/football/events` and `/api/football/fixtures`.
Configure the secret token as:

```bash
BZZOIRO_API_KEY=
```

For production on Vercel:

- Go to Project Settings > Environment Variables.
- Create `BZZOIRO_API_KEY` with the BSD/Bzzoiro API token.
- Select Production, Preview, and Development as needed.
- Save the variable.
- Redeploy the project after changing environment variables.

Do not use `NEXT_PUBLIC_` for this token, and do not expose it in client code.

Useful internal football routes:

- `GET /api/football/events?date=YYYY-MM-DD`
- `GET /api/football/events/[id]`
- `GET /api/football/events/[id]/analysis`
- `GET /api/football/events/[id]/full`
- `GET /api/football/events/[id]/odds`
- `GET /api/football/events/[id]/stats`

The Bzzoiro integration is isolated in:

- `src/services/bzzoiro/client.js`
- `src/services/football/footballAnalysisService.js`
- `src/services/football/adapters/bzzoiroAdapter.js`
