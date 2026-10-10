# joaca

Proiect de joacă și test pentru experimente rapide în Python.

## Pornire

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 main.py
```

## Teste

```bash
pytest
```

## Structură

| Fișier / folder        | Rol                                   |
|------------------------|---------------------------------------|
| `main.py`              | Punctul de pornire al programului     |
| `tests/`               | Testele automate (pytest)             |
| `requirements.txt`     | Pachetele Python necesare             |
| `.github/workflows/`   | Rulează testele automat pe GitHub     |
