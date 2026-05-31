export function CGVPage() {
  return (
    <div className="min-h-screen bg-[#0A1628] py-16">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mb-2">Conditions Générales de Vente</h1>
        <p className="text-gray-400 mb-12">Dernière mise à jour : janvier 2026</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">1. Objet et champ d'application</h2>
            <p>Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre CYNA SAS et toute entreprise (ci-après "le Client") souscrivant à ses services de cybersécurité SaaS.</p>
            <p className="mt-3">Ces CGV s'appliquent exclusivement à des professionnels (B2B) et non à des consommateurs particuliers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">2. Services et tarifs</h2>
            <p>CYNA SAS propose les abonnements suivants :</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border border-white/10 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-white/5 text-white">
                    <th className="px-4 py-3 text-left">Service</th>
                    <th className="px-4 py-3 text-right">Mensuel (HT)</th>
                    <th className="px-4 py-3 text-right">Annuel (HT)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Cyna SOC Premium', '1 299 €', '1 079 €/mois'],
                    ['Cyna EDR Enterprise', '899 €', '746 €/mois'],
                    ['Cyna XDR Suite', '1 799 €', '1 493 €/mois'],
                    ['Cyna SOC Essentials', '699 €', '580 €/mois'],
                  ].map(([name, monthly, annual]) => (
                    <tr key={name} className="border-t border-white/10">
                      <td className="px-4 py-3">{name}</td>
                      <td className="px-4 py-3 text-right">{monthly}</td>
                      <td className="px-4 py-3 text-right">{annual}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm">Tous les prix sont indiqués hors taxes (HT). La TVA applicable (20%) est ajoutée lors de la facturation.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">3. Commandes et abonnements</h2>
            <p>La souscription à un service CYNA s'effectue en ligne via la plateforme. La commande est confirmée après validation du paiement.</p>
            <p className="mt-3">Les abonnements sont :</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong className="text-white">Mensuel :</strong> renouvelé automatiquement chaque mois</li>
              <li><strong className="text-white">Annuel :</strong> facturé annuellement avec une réduction de ~17%</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">4. Paiement</h2>
            <p>Le paiement est réalisé par carte bancaire via notre système sécurisé. Les données de paiement ne sont jamais stockées sur nos serveurs.</p>
            <p className="mt-3">En cas d'échec de paiement lors du renouvellement, le service peut être suspendu après un délai de 7 jours et plusieurs tentatives de débit.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">5. Rétractation et remboursement</h2>
            <p>Conformément à l'article L.221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux services SaaS dont l'exécution a commencé, avec l'accord préalable du Client, avant l'expiration du délai de rétractation.</p>
            <p className="mt-3">Toutefois, dans un souci de satisfaction client, CYNA SAS peut examiner toute demande de remboursement au cas par cas dans les 48h suivant la souscription.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">6. Résiliation</h2>
            <p>Le Client peut résilier son abonnement à tout moment depuis son Espace Client.</p>
            <ul className="list-disc list-inside mt-3 space-y-1">
              <li><strong className="text-white">Abonnement mensuel :</strong> la résiliation prend effet à la fin de la période en cours</li>
              <li><strong className="text-white">Abonnement annuel :</strong> la résiliation prend effet à l'échéance annuelle; aucun remboursement proratisé n'est effectué sauf cas exceptionnel</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">7. Niveaux de service (SLA)</h2>
            <p>CYNA SAS s'engage sur les niveaux de service suivants :</p>
            <ul className="list-disc list-inside mt-3 space-y-1">
              <li>Disponibilité de la plateforme : <strong className="text-white">99,9%</strong> par mois</li>
              <li>Support technique : réponse sous <strong className="text-white">4h ouvrées</strong></li>
              <li>Incidents critiques : prise en charge sous <strong className="text-white">1h</strong></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">8. Responsabilités</h2>
            <p>La responsabilité de CYNA SAS est limitée au montant des sommes versées par le Client au cours des 12 derniers mois. CYNA SAS ne saurait être tenue responsable des dommages indirects (perte de données, perte d'exploitation, etc.).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">9. Droit applicable</h2>
            <p>Les présentes CGV sont soumises au droit français. En cas de litige, les parties s'engagent à rechercher une solution amiable avant toute action judiciaire. À défaut, le Tribunal de Commerce de Paris sera seul compétent.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
