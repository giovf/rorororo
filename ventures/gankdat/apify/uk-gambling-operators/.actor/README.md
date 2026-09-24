# UK Gambling Commission Licence Register (Operators, Premises)

**Every licensed gambling operator in Great Britain**, from the Gambling Commission's official public register files (refreshed daily, Open Government Licence v3). Three record kinds in one dataset, told apart by `record_type`:

- **licence** — one row per operating licence: licence number, status (Active, Surrendered, Revoked, Lapsed, …), type (Remote, Non-Remote, Ancillary Remote), licensed activities (betting, casino, bingo, gaming machines, lotteries, gambling software), start and end dates, and the operator's active trading names.
- **domain** — every website domain registered against an operator, with its status.
- **premises** — every licensed premises (betting shops, casinos, bingo halls, adult gaming centres, family entertainment centres) with activity, licensing authority (council), address and postcode.

## What people use it for
- **KYB, payments and banking risk** — is this operator (or this licence number) active, remote or non-remote, and for which activities?
- **Affiliate and marketing compliance** — is this domain licensed in Great Britain, and by whom?
- **Change monitoring** — new licences, surrenders and revocations, new domains and premises (gankdat's daily change feed).
- **Sector suppliers and analysts** — premises by council or postcode area; operators by activity.

## Output (one item per licence, domain or premises)
`id, record_type, account_number, operator_name, licence_number, status, is_active, licence_type, activities, start_date, end_date, trading_names, domain_name, local_authority, address, city, postcode, outward_code, register_url`

## Data posture
Statutory public register, organisation level: licensed businesses, their trading names, domains and business premises as published by the Gambling Commission. The personal licence registers (management and functional licences held by individuals) are never used. Pay per result; set **Maximum results** to control spend. Data from gankdat.com (REST API, MCP server, daily change feeds).
