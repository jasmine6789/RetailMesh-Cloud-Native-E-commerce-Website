# Architecture Diagrams — RetailMesh

Eraser.io diagrams that extend the **mermaid** diagrams in [README.md](../README.md) and deployment notes in [Deployments/README.md](../Deployments/README.md).

## Viewing

Open `.eraserdiagram` files in the [Eraser.io editor](https://app.eraser.io).

## Core diagrams (maintained)

| File | Topic |
|------|--------|
| [system-architecture.eraserdiagram](system-architecture.eraserdiagram) | Service topology and boundaries |
| [event-driven-architecture.eraserdiagram](event-driven-architecture.eraserdiagram) | RabbitMQ / async messaging |
| [saga-checkout.eraserdiagram](saga-checkout.eraserdiagram) | Checkout saga orchestration |
| [add-to-cart-flow.eraserdiagram](add-to-cart-flow.eraserdiagram) | Add-to-cart sequence |
| [mfe-runtime-composition.eraserdiagram](mfe-runtime-composition.eraserdiagram) | Host + federated MFE runtime |
| [kubernetes-topology.eraserdiagram](kubernetes-topology.eraserdiagram) | K8s deployment layout |
| [cicd-pipeline-flow.eraserdiagram](cicd-pipeline-flow.eraserdiagram) | CI/CD stages |
| [observability-telemetry-flow.eraserdiagram](observability-telemetry-flow.eraserdiagram) | Metrics, logs, traces |

## Archive

Supplementary or overlapping diagrams (clean-architecture variants, checkout phase splits, appendix traces, etc.) live in [archive/](archive/). They are kept for reference but are not required for day-to-day work.
