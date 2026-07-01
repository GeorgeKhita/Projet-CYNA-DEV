<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de commande {{ $invoiceNumber }}</title>
</head>
<body style="background:#0A1628;font-family:Arial,sans-serif;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    {{-- En-tête CYNA --}}
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#00B4D8;font-size:28px;font-weight:800;letter-spacing:2px;margin:0;">CYNA</h1>
      <p style="color:#64748b;font-size:13px;margin:4px 0 0;">Cybersecurity as a Service</p>
    </div>

    {{-- Bloc principal --}}
    <div style="background:#0f2040;border:1px solid #1e3a5f;border-radius:12px;padding:32px;">

      {{-- Confirmation --}}
      <div style="text-align:center;margin-bottom:24px;">
        <div style="background:#10B98120;border:2px solid #10B981;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:32px;display:inline-block;">✓</div>
        <h2 style="color:#10B981;font-size:22px;margin:16px 0 4px;">Commande confirmée !</h2>
        <p style="color:#94a3b8;margin:0;">Merci {{ $user->first_name }}, votre paiement a bien été reçu.</p>
      </div>

      {{-- Numéro de commande --}}
      <div style="background:#0A1628;border-radius:8px;padding:16px;margin-bottom:24px;text-align:center;">
        <span style="color:#94a3b8;font-size:14px;">Numéro de commande : </span>
        <span style="color:#00B4D8;font-weight:bold;font-size:16px;">{{ $invoiceNumber }}</span>
      </div>

      {{-- Tableau des produits --}}
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr>
            <th style="text-align:left;color:#64748b;font-size:12px;padding-bottom:8px;text-transform:uppercase;">Produit</th>
            <th style="text-align:center;color:#64748b;font-size:12px;padding-bottom:8px;text-transform:uppercase;">Période</th>
            <th style="text-align:right;color:#64748b;font-size:12px;padding-bottom:8px;text-transform:uppercase;">Montant</th>
          </tr>
        </thead>
        <tbody>
          @foreach($items as $item)
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #1e3a5f;color:#e2e8f0;">{{ $item['product_name'] }}</td>
            <td style="padding:8px 0;border-bottom:1px solid #1e3a5f;color:#94a3b8;text-align:center;">
              {{ $item['duration'] === 'annual' ? 'Annuel' : 'Mensuel' }}
            </td>
            <td style="padding:8px 0;border-bottom:1px solid #1e3a5f;color:#00B4D8;text-align:right;font-weight:bold;">
              {{ number_format($item['total_price'], 2, ',', ' ') }} €
            </td>
          </tr>
          @endforeach
        </tbody>
      </table>

      {{-- Total --}}
      <div style="text-align:right;border-top:2px solid #00B4D8;padding-top:16px;">
        <div style="color:#94a3b8;font-size:13px;margin-bottom:4px;">
          Sous-total HT : {{ number_format($subtotal, 2, ',', ' ') }} €
        </div>
        <div style="color:#94a3b8;font-size:13px;margin-bottom:8px;">
          TVA (20%) : {{ number_format($tax, 2, ',', ' ') }} €
        </div>
        <span style="color:#e2e8f0;font-size:18px;font-weight:bold;">Total TTC : </span>
        <span style="color:#00B4D8;font-size:22px;font-weight:800;">{{ number_format($total, 2, ',', ' ') }} €</span>
      </div>
    </div>

    {{-- Clés de licence --}}
    @if(count($licenses) > 0)
    <div style="background:#0f2040;border:1px solid #1e3a5f;border-radius:12px;padding:24px;margin-top:24px;">
      <h3 style="color:#00B4D8;margin:0 0 16px;font-size:16px;">🔑 Vos clés de licence</h3>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;color:#64748b;font-size:12px;padding-bottom:8px;text-transform:uppercase;">Produit</th>
            <th style="text-align:left;color:#64748b;font-size:12px;padding-bottom:8px;text-transform:uppercase;">Clé de licence</th>
          </tr>
        </thead>
        <tbody>
          @foreach($licenses as $license)
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #1e3a5f;color:#e2e8f0;">{{ $license['product_name'] }}</td>
            <td style="padding:8px 0;border-bottom:1px solid #1e3a5f;color:#00B4D8;font-family:monospace;font-weight:bold;">{{ $license['license_key'] }}</td>
          </tr>
          @endforeach
        </tbody>
      </table>
      <p style="color:#94a3b8;font-size:12px;margin:16px 0 0;">Conservez précieusement ces clés. Elles vous permettront d'activer vos logiciels.</p>
    </div>
    @endif

    {{-- Pied de page --}}
    <p style="color:#475569;font-size:12px;text-align:center;margin-top:24px;">
      Votre facture PDF est jointe à cet email.<br>
      CYNA SAS — contact@cyna-it.fr
    </p>

  </div>
</body>
</html>
