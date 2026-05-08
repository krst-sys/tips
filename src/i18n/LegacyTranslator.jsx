"use client";

import { useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { legacyTranslations } from "@/i18n/legacyTranslations";

const reverseTranslations = Object.fromEntries(
  Object.entries(legacyTranslations).map(([pt, en]) => [en, pt])
);

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "OPTION"]);

function preserveSpacing(original, translated) {
  const leading = original.match(/^\s*/)?.[0] || "";
  const trailing = original.match(/\s*$/)?.[0] || "";
  return `${leading}${translated}${trailing}`;
}

function translateValue(value, dictionary) {
  const trimmed = value.trim();
  if (!trimmed) return value;
  return dictionary[trimmed] ? preserveSpacing(value, dictionary[trimmed]) : value;
}

function translateTree(root, dictionary) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    node.nodeValue = translateValue(node.nodeValue || "", dictionary);
  });

  root.querySelectorAll?.("[placeholder], [title], [aria-label]").forEach((element) => {
    ["placeholder", "title", "aria-label"].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (value) element.setAttribute(attribute, translateValue(value, dictionary));
    });
  });
}

export default function LegacyTranslator() {
  const { locale } = useLanguage();

  useEffect(() => {
    const dictionary = locale === "en-US" ? legacyTranslations : reverseTranslations;
    translateTree(document.body, dictionary);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            node.nodeValue = translateValue(node.nodeValue || "", dictionary);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            translateTree(node, dictionary);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [locale]);

  return null;
}
