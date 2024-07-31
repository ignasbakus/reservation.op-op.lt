<!DOCTYPE html>
<html lang="lt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jūsų užsakymas atšauktas</title>
</head>
<body>
<h1>Jūsų užsakymas buvo atšauktas</h1>
<p>Apgailestaujame, bet norime jus informuoti, kad jūsų užsakymas numeris: {{ $order->order_number }} buvo atšauktas.</p>
<br>

<?php if (!empty($additionalInfo)) : ?>
<h3>Priežastis:</h3>
<p><?php echo htmlspecialchars($additionalInfo); ?></p>
<?php endif; ?>

</body>
</html>
