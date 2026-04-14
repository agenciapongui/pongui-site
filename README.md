# Pongui — Site

Landing pages e site institucional da **Pongui Marketing Jurídico**.

## Estrutura

```
pongui-site/
├── trafegopago.html     # LP Google Ads (conversão)
├── obrigado.html        # Tela de sucesso do formulário
├── privacidade.html     # Política de Privacidade (LGPD)
├── CNAME                # pongui.com.br
├── robots.txt
├── sitemap.xml
└── assets/
    ├── css/style.css
    ├── js/form.js       # Multi-step qualificatório
    ├── js/main.js       # Smooth scroll + tracking hooks
    ├── favicon.svg
    └── img/
        ├── daniel/      # Fotos de Daniel Padilha
        ├── logo/        # Logo Pongui
        ├── parceiros/   # Fotos dos clientes
        └── resultados/  # Prints de WhatsApp
```

## Deploy (GitHub Pages)

1. Repositório: `pongui-site`
2. Domínio customizado: `pongui.com.br` (via CNAME)
3. Settings → Pages → Source: `main` / (root)
4. Página principal de conversão: `/trafegopago.html`

## Formulário

O form é um multi-step em JS puro (`assets/js/form.js`).

### Endpoint do CRM/webhook

Atualmente o form **não envia dados** — redireciona direto pra `obrigado.html`
após o submit. Para ativar o POST:

1. Abra `assets/js/form.js`
2. Defina `FORM_ENDPOINT` com a URL do seu webhook (ex: Formspree, Zapier, CRM)
3. Mude `POST_ENABLED = true`

Payload enviado:
```json
{
  "nome": "string",
  "telefone": "(XX) XXXXX-XXXX",
  "faturamento": "ate_10k | 10k_25k | 25k_50k | 50k_100k | acima_100k",
  "investimento": "ate_1500 | 1500_3000 | 3000_5000 | acima_5000 | null",
  "timestamp": "ISO8601",
  "origem": "URL completa",
  "classificacao": "mql_premium | mql | downsell | desqualificado"
}
```

## Imagens esperadas

Caminhos usados pelo HTML (todos com fallback visual se o arquivo não existir):

- `/assets/img/logo/logo-branca.png` — logo 140×40
- `/assets/img/daniel/palestrando-1.jpg` — hero + autoridade
- `/assets/img/resultados/print-whatsapp-1.jpg` — case Antonio Tessitore
- `/assets/img/resultados/print-whatsapp-2.jpg` — case advogada ambiental
- `/assets/favicon.ico` — opcional (SVG já incluso)

## Stack

HTML5 + CSS3 + JS vanilla. Zero framework, zero build step.
Google Fonts (Oswald, Noto Sans Armenian, Ubuntu) + FontAwesome 6 via CDN.
