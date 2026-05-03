# Product

## Register

product

## Users

Educators, researchers, academic reviewers, and institutional teams who need to inspect submitted writing for likely AI authorship. They use the product while reviewing essays, papers, reports, or documents where the result must be understandable, defensible, and treated as probabilistic evidence rather than absolute proof.

## Product Purpose

VeriAI detects likely AI-generated text by letting users paste text or upload PDF/DOCX documents, submit them through the Spring Boot backend, and review RoBERTa, stylistic, statistical, model-attribution, and sentence-level signals returned by the analysis pipeline. Success means the user can submit content, understand the status of the analysis, interpret the result responsibly, and keep backend integration contracts intact.

## Brand Personality

Precise, trustworthy, and academic. The interface should feel calm under scrutiny: serious enough for institutional review, transparent about uncertainty, and direct about what the system can and cannot prove.

## Anti-references

Avoid generic AI SaaS dashboards, decorative glassmorphism that obscures evidence, fake enterprise metrics, unsupported controls, dark neon “AI lab” styling, and interfaces that imply detector results are courtroom-level proof. Do not make the product feel like a marketing demo once the user is inside the analysis workflow.

## Design Principles

1. Evidence before spectacle: analysis results, uncertainty, and source text must be easier to inspect than the decoration around them.
2. Honest states only: visible controls should either work, be clearly unavailable, or be removed.
3. Preserve the backend contract: frontend copy, limits, auth, quota, and result rendering must match the Spring Boot API and AI pipeline behavior.
4. Probabilistic by default: labels and copy should help reviewers treat results as guidance, not final judgment.
5. Review under pressure: layouts should remain legible with long text, failed requests, slow analysis, and limited plan/quota states.

## Accessibility & Inclusion

Target WCAG AA for contrast, keyboard navigation, focus visibility, labels, and error communication. Avoid relying only on red/green color to communicate AI/human labels. Respect reduced-motion preferences for animation-heavy backgrounds or chart transitions.
