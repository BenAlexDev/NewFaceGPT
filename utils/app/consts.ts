// export const SUPABSE_URL = process.env.SUPABASE_URL;
// export const SUPABSE_ANNON_KEY = process.env.SUPABASE_ANNON_KEY;

export const SUPABSE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
export const SUPABSE_ANNON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  export const FB_CLIENT_ID =
  process.env.NEXT_PUBLIC_FB_CLIENT_ID || '';

export const COMMENTS = {
  entry: [
    {
      id: 1101231223,
      time: 1692903000,
      changes: [
        {
          "value": {
            "item": "status",
            "post_id": "44444444_444444444",
            "verb": "add",
            "published": 1,
            "created_time": 1695727791,
            "message": "Example post content.",
            "comment_id": "323073609378563_637699484891927",
            "from": {
              "name": "Test Page",
              "id": "1067280970047460"
            }
          },
        }
      ]
    }
  ],
  object: 'page'
}

export const PAGES = [
  {name: 'Dashboard', path: 'dashboard'},
  {name: 'Comments', path: 'comments'},
  {name: 'Learning', path: 'learning'},
]
export const SAMPLE_PAGES_LIST =  [
  {
      "access_token": "EAAW2ux9zq1QBO3FNWc94YYrqvMfWNjkjHPdfK54RZCCDWaIhOrlLqxUMMxxvj3yZC7v4AIIBYHRhvESiOo4c9FfqpKUiugnOis4ZBkZAkaxyJuu42xtLIng3EtUX8aB9udG8wcUJf4cnfZApLxKZBzYZBUsqvomZBfXBZCJE3CqqSuZCqgvVYq7PGmUEzum0mt",
      "category": "Zeitschrift",
      "category_list": [
          {
              "id": "1307",
              "name": "Zeitschrift"
          }
      ],
      "name": "tagesfokus.de",
      "id": "119487201245229",
      "tasks": [
          "ADVERTISE",
          "ANALYZE",
          "CREATE_CONTENT",
          "MESSAGING",
          "MODERATE",
          "MANAGE",
          "MANAGE_LEADS"
      ]
  },
  {
      "access_token": "EAAW2ux9zq1QBO3ImFJaqHUqLuFS3dZBHot9pA2GP6N4Q75OMQZCqTq6W18uz9eHuaUdrKvmiRc4u09aagk7F1V3JzUAAh96Bq4eZCpv28uJJ48ScdWMfA8fQMhxMH18nbKIsXwmWAuy7vp431rly8wdpwuB5dnVxy7b70jMv8DlOlE0lkyIOHrZA4OuJ",
      "category": "Produkt/Dienstleistung",
      "category_list": [
          {
              "id": "2201",
              "name": "Produkt/Dienstleistung"
          },
          {
              "id": "183680385005847",
              "name": "Geschäft für Haushaltsbedarf"
          }
      ],
      "name": "WunderRein",
      "id": "102041614815098",
      "tasks": [
          "ADVERTISE",
          "ANALYZE",
          "CREATE_CONTENT",
          "MESSAGING",
          "MODERATE",
          "MANAGE",
          "MANAGE_LEADS"
      ]
  }
]
export const THEME_COLOR = '#E0E049';
export const THEM_SPLITER_COLOR='#E5E7EB';
export const THEM_BORDER_COLOR='#919EAB52';
export const SOCIAL_CHANNEL = [
  
]
export const MOBILE_MODE_SIZE = 768;
