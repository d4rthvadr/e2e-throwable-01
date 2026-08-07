---
name: playwright-test-generator
description: "Generate Playwright tests from a scenario by first using browser automation to execute the flow, observe the UI, capture stable selectors, and then write deterministic tests. Use for scenario-driven UI test generation, browser-based verification, and Playwright starter suites."
argument-hint: "Scenario to turn into Playwright tests"
user-invocable: true
disable-model-invocation: false
---

# Playwright Test Generator

Generate Playwright tests from a scenario by first executing the scenario in the browser, observing the UI, and collecting evidence before writing any test code.

## When to use

- A user provides a UI scenario and wants Playwright tests generated from it.
- You need to inspect the app in a browser before writing assertions.
- The goal is to create deterministic, maintainable tests with stable selectors.
- The scenario may require login, navigation, form submission, or data persistence checks.

## Procedure

1. Read the scenario carefully and identify the minimal user journey.
2. Open the app in the browser and execute the scenario step by step.
3. Record what the user sees at each meaningful step.
4. Capture stable selectors, test IDs, labels, and URLs that are safe to automate against.
5. Note any data setup, login state, seed data, or cleanup needed for repeatability.
6. After the browser run is complete, write Playwright tests that mirror the observed behavior.
7. Keep the test set small and focused unless the scenario clearly needs multiple cases.

## Output format

1. Short execution summary
2. Suggested test cases
3. Playwright test code
4. Notes on selectors, assumptions, and missing coverage

## Test quality rules

- Prefer stable selectors over brittle CSS or text-only locators when possible.
- Use Arrange / Act / Assert structure.
- Make tests deterministic and independent.
- Include explicit assertions for navigation, visibility, and persisted state.
- Do not generate tests until after browser verification is complete.

## Practical guidance

- If the scenario includes authentication, verify the auth gate and session behavior.
- If the scenario creates or mutates data, confirm the final state after reload when relevant.
- If the app exposes test IDs, use them in the generated tests.
- If a selector is ambiguous, document the assumption rather than inventing a brittle selector.
- Keep the generated tests aligned with the observed browser behavior, not just the written scenario.
