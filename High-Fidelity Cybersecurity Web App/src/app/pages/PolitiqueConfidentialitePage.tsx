export function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-[#0A1628] py-16">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mb-2">Politique de confidentialité</h1>
        <p className="text-gray-400 mb-12">Dernière mise à jour : janvier 2026 — Conforme au RGPD</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">1. Responsable du traitement</h2>
            <p><strong className="text-white">CYNA SAS</strong><br />
            123 rue de la Cybersécurité, 75001 Paris, France<br />
            Email DPO : <a href="mailto:dpo@cyna-it.fr" className="text-[#00B4D8] hover:underline">dpo@cyna-it.fr</a></p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">2. Données collectées</h2>
            <p>Nous collectons les données suivantes :</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li><strong className="text-white">Données d'identification :</strong> nom, prénom, adresse email, nom de l'entreprise, numéro de téléphone</li>
              <li><strong className="text-white">Données de connexion :</strong> adresse IP, logs de connexion, timestamps</li>
              <li><strong className="text-white">Données de facturation :</strong> montants, dates, références de commandes</li>
              <li><strong className="text-white">Données d'utilisation :</strong> pages visitées, actions effectuées sur la plateforme</li>
              <li><strong className="text-white">Cookies :</strong> cookies techniques nécessaires au fonctionnement, cookies analytiques (avec consentement)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">3. Finalités du traitement</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>Gérer votre compte et l'accès aux services</li>
              <li>Traiter vos commandes et abonnements</li>
              <li>Émettre vos factures</li>
              <li>Vous envoyer des notifications relatives à votre compte</li>
              <li>Répondre à vos demandes de support</li>
              <li>Améliorer nos services (données anonymisées)</li>
              <li>Respecter nos obligations légales et comptables</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">4. Base légale des traitements</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white">Exécution du contrat :</strong> gestion du compte, commandes, facturation</li>
              <li><strong className="text-white">Obligation légale :</strong> conservation des données comptables (10 ans)</li>
              <li><strong className="text-white">Intérêt légitime :</strong> sécurité de la plateforme, prévention de la fraude</li>
              <li><strong className="text-white">Consentement :</strong> cookies analytiques et communications marketing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">5. Durée de conservation</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Données de compte : durée de vie du compte + 3 ans après résiliation</li>
              <li>Données de facturation : 10 ans (obligation légale)</li>
              <li>Logs de connexion : 12 mois</li>
              <li>Données de support : 3 ans</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">6. Vos droits (RGPD)</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li><strong className="text-white">Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
              <li><strong className="text-white">Droit de rectification :</strong> corriger vos données inexactes</li>
              <li><strong className="text-white">Droit à l'effacement :</strong> supprimer vos données (sous conditions)</li>
              <li><strong className="text-white">Droit à la portabilité :</strong> recevoir vos données dans un format lisible par machine</li>
              <li><strong className="text-white">Droit d'opposition :</strong> vous opposer à certains traitements</li>
              <li><strong className="text-white">Droit à la limitation :</strong> limiter le traitement de vos données</li>
            </ul>
            <p className="mt-4">Pour exercer ces droits, rendez-vous dans <strong className="text-white">Espace client → Paramètres → Export RGPD</strong> ou contactez notre DPO à <a href="mailto:dpo@cyna-it.fr" className="text-[#00B4D8] hover:underline">dpo@cyna-it.fr</a>.</p>
            <p className="mt-3">Vous avez également le droit d'introduire une réclamation auprès de la <strong className="text-white">CNIL</strong> (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[#00B4D8] hover:underline">www.cnil.fr</a>).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">7. Cookies</h2>
            <p>Nous utilisons des cookies pour le bon fonctionnement de la plateforme. Vous pouvez gérer vos préférences via le bandeau de consentement cookies présent sur le site.</p>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li><strong className="text-white">Cookies essentiels :</strong> authentification, sécurité (non désactivables)</li>
              <li><strong className="text-white">Cookies analytiques :</strong> mesure d'audience anonymisée (avec consentement)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">8. Sécurité des données</h2>
            <p>CYNA SAS met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement TLS, hachage des mots de passe (bcrypt), authentification à deux facteurs pour les administrateurs, journalisation des accès.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
