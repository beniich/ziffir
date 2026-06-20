# 🛡️ Audit de Sécurité et Conformité : SOC 2 & ISO 27001
**Application** : Sapphire PMS  
**Date** : 19 Juin 2026  
**Objectif** : Évaluation de l'état de préparation aux normes SOC 2 (Security, Confidentiality, Privacy) et ISO/IEC 27001:2022.

---

> [!NOTE]
> Ce document est un audit interne "Readiness Assessment". Il évalue les mesures techniques déjà implémentées dans le code de Sapphire PMS par rapport aux exigences des normes SOC 2 et ISO 27001, et identifie les étapes restantes (techniques et organisationnelles) pour une certification officielle.

## 1. Résumé Exécutif

L'architecture actuelle de Sapphire PMS a été conçue avec le principe de **Security by Design** et de **Privacy by Design**. Les fondamentaux techniques pour passer avec succès les audits SOC 2 et ISO 27001 sont déjà en place, notamment grâce au chiffrement des données (AES-256-GCM), à un registre d'audit inaltérable (SHA-256), et à une gestion stricte des identités (RBAC).

**Niveau de préparation technique estimé : 85%**

---

## 2. Cartographie des Contrôles (ISO 27001 & SOC 2)

### 2.1. Contrôle d'Accès & Authentification (ISO A.9 / SOC 2 CC6)
L'objectif est d'empêcher l'accès non autorisé aux systèmes et aux informations.

- ✅ **Contrôles implémentés** :
  - Authentification par **JWT (JSON Web Tokens)** stockés dans des cookies `HttpOnly` et `Secure`, empêchant les attaques XSS.
  - **RBAC (Role-Based Access Control)** strict avec 5 niveaux : `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `STAFF`, `GUEST`. Les requêtes API vérifient le rôle et l'appartenance au locataire (`hotelId`).
  - Hachage des mots de passe utilisant **bcrypt** (cost factor 12).
  - Infrastructure prête pour l'Authentification à Double Facteur (2FA), avec la propriété `twoFactorEnabled` dans la base de données.
  - Sessions à durée de vie limitée (12h).
- ⚠️ **Recommandations (Gaps)** :
  - Forcer l'activation de la 2FA (MFA) pour les rôles `ADMIN` et `MANAGER`.
  - Implémenter le blocage automatique des comptes après X tentatives infructueuses (brute-force protection).

### 2.2. Cryptographie & Protection des Données (ISO A.10 / SOC 2 CC6.1, Confidentiality)
Garantir la confidentialité des données au repos et en transit.

- ✅ **Contrôles implémentés** :
  - **Chiffrement au repos** : Les PII (Personally Identifiable Information) critiques telles que les numéros de passeport, téléphones et données médicales (allergies) sont chiffrées au niveau applicatif en **AES-256-GCM** avec un sel dédié (`PII_ENCRYPTION_SALT`).
  - **Chiffrement en transit** : Utilisation exclusive de **TLS 1.2/1.3** via la configuration Nginx proxy (`listen 443`).
  - Recherches sécurisées : Utilisation de `documentNumberHash` (SHA-256) pour permettre la recherche exacte de documents chiffrés sans révéler le contenu en clair.
- ⚠️ **Recommandations (Gaps)** :
  - Mettre en place un système de rotation automatisée des clés cryptographiques (`PII_ENCRYPTION_KEY`).

### 2.3. Sécurité des Communications et Opérations (ISO A.12, A.13 / SOC 2 CC6.6)
Protéger les systèmes contre les logiciels malveillants, les attaques réseau et garantir la disponibilité.

- ✅ **Contrôles implémentés** :
  - Prévention des injections SQL : Utilisation de **Prisma ORM** qui utilise nativement des requêtes paramétrées.
  - Headers de sécurité via **Helmet** (HSTS, X-Frame-Options, X-Content-Type-Options).
  - Protection **CORS** stricte restreinte au `FRONTEND_URL`.
  - **Rate Limiting** implémenté au niveau de l'API (Middleware Express) et au niveau de Nginx (10 req/s avec burst).
- ⚠️ **Recommandations (Gaps)** :
  - Déployer un WAF (Web Application Firewall) tel que Cloudflare en amont de Nginx pour bloquer activement les attaques DDoS et le top 10 de l'OWASP.

### 2.4. Journalisation, Monitoring et Audit (ISO A.12.4 / SOC 2 CC7)
S'assurer que les événements de sécurité sont enregistrés et inaltérables.

- ✅ **Contrôles implémentés** :
  - **Forensic Audit Ledger** : Sapphire intègre un journal d'audit des actions (`AuditAction`) comprenant plus de 20 événements critiques (ex: `GUEST_PII_ACCESSED`, `DATA_EXPORTED`).
  - **Chaînage Cryptographique** : Les logs d'audit utilisent une chaîne de hachage SHA-256, rendant l'historique inviolable (append-only ledger).
  - Healthchecks automatiques (Docker/Nginx) pour garantir la disponibilité.
  - Configuration prête pour l'envoi des logs vers **Sentry** (Monitoring d'erreurs).
- ⚠️ **Recommandations (Gaps)** :
  - Mettre en place des alertes automatisées (SIEM) si une rupture de la chaîne cryptographique de l'audit est détectée ou si de multiples erreurs d'authentification surviennent.

### 2.5. Conformité RGPD et Privacy (ISO A.18 / SOC 2 Privacy Criteria)
Protection des données personnelles selon la réglementation.

- ✅ **Contrôles implémentés** :
  - Support natif du droit à l'oubli (Right to be forgotten) avec le flag `isAnonymized`.
  - Consentement marketing tracable (`marketingConsent`, `consentDate`).
  - Log spécifique (`GUEST_PII_ACCESSED`) lorsqu'un employé visualise les données sensibles déchiffrées.
  - Ségrégation des données multi-tenant (isolation absolue par `hotelId` via Prisma).

---

## 3. Plan d'Action pour la Certification

Pour obtenir les certifications officielles SOC 2 Type II et ISO 27001, Sapphire doit compléter son dispositif technique par un volet organisationnel.

> [!IMPORTANT]
> Les normes ISO 27001 et SOC 2 évaluent autant (sinon plus) les processus d'entreprise que le code lui-même.

### Phase 1 : Améliorations Techniques Restantes (Code)
1. Rendre obligatoire la 2FA pour tout utilisateur ayant un rôle `ADMIN` ou `SUPER_ADMIN`.
2. Intégrer un outil d'analyse statique de code (SAST) et de scan de vulnérabilités des dépendances dans les workflows GitHub Actions existants.
3. Configurer les sauvegardes automatisées de PostgreSQL avec des tests de restauration réguliers et documentés.

### Phase 2 : Processus Organisationnels (Gouvernance)
Pour ISO 27001, il faut établir un **SMSI** (Système de Management de la Sécurité de l'Information).
1. **Politiques de Sécurité** : Rédiger les documents officiels (Charte informatique, politique de mots de passe, gestion des accès).
2. **Gestion des Incidents (Incident Response Plan)** : Créer un processus formel documentant la réaction de l'équipe en cas de violation de données (Data Breach).
3. **Contrôle des Fournisseurs** : Évaluer la conformité de vos sous-traitants (Vercel, Railway, Stripe, Resend). *Bonne nouvelle : ils sont tous déjà certifiés SOC 2.*
4. **Onboarding/Offboarding** : Procédures strictes pour l'arrivée et le départ des employés (révocation immédiate des accès).

### Phase 3 : Audit Officiel
1. **SOC 2 Type I** : Audit ponctuel validant que vos politiques et votre code sont correctement conçus à un instant T. (Prêt à 90%)
2. **SOC 2 Type II / ISO 27001** : Période d'observation de 3 à 6 mois durant laquelle l'auditeur externe vérifie que vous appliquez réellement vos propres règles (ex: revues de code effectuées, logs non falsifiés, sauvegardes testées).

---

## Conclusion

Le logiciel **Sapphire PMS a une excellente maturité en matière de cybersécurité**. Le fait d'avoir intégré le chiffrement des données au repos et un registre d'audit chaîné par SHA-256 dès le MVP constitue un atout décisif qui facilitera grandement le travail de l'auditeur externe. 

La priorité immédiate est la formalisation des processus internes (politiques de l'entreprise) et la mise en place d'un WAF pour la protection périmétrique.
