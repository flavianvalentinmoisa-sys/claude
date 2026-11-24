# Header: ascunde căutarea și contul

În `sections/header.liquid`:
- variabila `c_show_account` = conturi de client activate **și** `section.settings.show_account`; înlocuiește `shop.customer_accounts_enabled` în clasa `header--has-account`, în condiția `render_search_left` și la afișarea `<shopify-account>`;
- căutarea (stânga pe mobil și din `header__icons`) se afișează doar dacă `section.settings.show_search`;
- schema: două checkbox-uri noi înainte de `sticky_header_type`: `show_search` („Arată căutarea”) și `show_account` („Arată contul (login)”), implicit bifate.

În `sections/header-group.json`, pe tema „UtilPerfect - aliniere text”, sunt setate pe `false`.
