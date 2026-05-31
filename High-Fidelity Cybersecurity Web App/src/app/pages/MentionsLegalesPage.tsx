export function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-[#0A1628] py-16">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mb-2">Mentions légales</h1>
        <p className="text-gray-400 mb-12">Dernière mise à jour : janvier 2026</p>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">Éditeur du site</h2>
            <p><strong className="text-white">CYNA SAS</strong><br />
            Société par Actions Simplifiée au capital de 50 000 €<br />
            Siège social : 123 rue de la Cybersécurité, 75001 Paris, France<br />
            RCS Paris : 123 456 789<br />
            Numéro de TVA intracommunautaire : FR12 345 678 901<br />
            Email : <a href="mailto:contact@cyna-it.fr" className="text-[#00B4D8] hover:underline">contact@cyna-it.fr</a><br />
            Téléphone : +33 1 23 45 67 89</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">Directeur de la publication</h2>
            <p>Le directeur de la publication est le Président de CYNA SAS.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">Hébergement</h2>
            <p>Le site est hébergé par :<br />
            <strong className="text-white">OVH SAS</strong><br />
            2 rue Kellermann, 59100 Roubaix, France<br />
            Téléphone : 1007</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">Propriété intellectuelle</h2>
            <p>L'ensemble des contenus présents sur ce site (textes, images, logos, graphismes, etc.) sont la propriété exclusive de CYNA SAS ou de ses partenaires et sont protégés par les lois françaises et internationales relatives à la propriété intellectuelle.</p>
            <p className="mt-3">Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de CYNA SAS.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">Limitation de responsabilité</h2>
            <p>CYNA SAS s'efforce de fournir des informations aussi précises que possible sur ce site. Toutefois, elle ne peut garantir l'exactitude, la complétude ou l'actualité des informations diffusées. En conséquence, CYNA SAS décline toute responsabilité pour toute inexactitude, imprécision ou omission portant sur des informations disponibles sur ce site.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">Droit applicable</h2>
            <p>Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront compétents.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">Contact</h2>
            <p>Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter à l'adresse : <a href="mailto:legal@cyna-it.fr" className="text-[#00B4D8] hover:underline">legal@cyna-it.fr</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
