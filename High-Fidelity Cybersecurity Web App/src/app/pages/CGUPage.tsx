export function CGUPage() {
  return (
    <div className="min-h-screen bg-[#0A1628] py-16">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mb-2">Conditions Générales d'Utilisation</h1>
        <p className="text-gray-400 mb-12">Dernière mise à jour : janvier 2026</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">1. Objet</h2>
            <p>Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et conditions d'utilisation des services proposés par CYNA SAS via la plateforme accessible à l'adresse <strong className="text-white">cyna-it.fr</strong>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">2. Acceptation des CGU</h2>
            <p>L'accès et l'utilisation de la plateforme CYNA impliquent l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.</p>
            <p className="mt-3">CYNA SAS se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification par email ou via la plateforme.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">3. Description des services</h2>
            <p>CYNA est une plateforme SaaS de cybersécurité proposant les services suivants :</p>
            <ul className="list-disc list-inside mt-3 space-y-1">
              <li>SOC – Security Operations Center as a Service</li>
              <li>EDR – Endpoint Detection &amp; Response as a Service</li>
              <li>XDR – Extended Detection &amp; Response as a Service</li>
            </ul>
            <p className="mt-3">Ces services sont destinés exclusivement à une clientèle professionnelle (B2B).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">4. Création de compte</h2>
            <p>L'accès aux services nécessite la création d'un compte utilisateur. Vous vous engagez à :</p>
            <ul className="list-disc list-inside mt-3 space-y-1">
              <li>Fournir des informations exactes et complètes lors de l'inscription</li>
              <li>Maintenir ces informations à jour</li>
              <li>Garder la confidentialité de vos identifiants de connexion</li>
              <li>Informer CYNA immédiatement en cas d'utilisation non autorisée de votre compte</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">5. Utilisation acceptable</h2>
            <p>En utilisant nos services, vous vous engagez à ne pas :</p>
            <ul className="list-disc list-inside mt-3 space-y-1">
              <li>Utiliser les services à des fins illégales ou non autorisées</li>
              <li>Tenter d'accéder aux systèmes de CYNA ou de ses clients sans autorisation</li>
              <li>Transmettre des virus ou tout autre code malveillant</li>
              <li>Partager vos identifiants avec des tiers</li>
              <li>Revendre ou sous-licencier l'accès aux services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">6. Disponibilité des services</h2>
            <p>CYNA SAS s'engage à maintenir une disponibilité des services de 99,9% (SLA). Des interruptions planifiées pour maintenance peuvent survenir et seront communiquées à l'avance.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">7. Propriété intellectuelle</h2>
            <p>Tous les droits de propriété intellectuelle relatifs à la plateforme CYNA et à ses services appartiennent à CYNA SAS. Aucune licence n'est accordée en dehors du droit d'utilisation des services tels que décrits dans ces CGU.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">8. Résiliation</h2>
            <p>CYNA SAS se réserve le droit de suspendre ou de résilier votre accès aux services en cas de violation des présentes CGU, sans préavis et sans remboursement.</p>
            <p className="mt-3">Vous pouvez résilier votre abonnement à tout moment depuis votre espace client, sous réserve des conditions prévues dans les CGV.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">9. Droit applicable et juridiction</h2>
            <p>Les présentes CGU sont régies par le droit français. Tout litige relatif à leur interprétation ou exécution sera soumis aux tribunaux compétents de Paris.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">10. Contact</h2>
            <p>Pour toute question relative aux présentes CGU : <a href="mailto:legal@cyna-it.fr" className="text-[#00B4D8] hover:underline">legal@cyna-it.fr</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
