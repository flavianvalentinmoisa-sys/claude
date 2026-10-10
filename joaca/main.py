#!/usr/bin/env python3
"""Punctul de pornire al proiectului joaca."""


def salut(nume: str = "lume") -> str:
    return f"Salut, {nume}!"


if __name__ == "__main__":
    print(salut())
