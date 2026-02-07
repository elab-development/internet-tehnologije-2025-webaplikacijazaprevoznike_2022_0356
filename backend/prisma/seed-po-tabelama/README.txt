Redosled pokretanja (u pgAdminu: otvori fajl, Ctrl+A, F5):

1. 01-category.sql   → trebalo bi: INSERT 0 3
2. 02-product.sql    → trebalo bi: INSERT 0 14  (koristi categoryId 1,2,3 i supplierId 2,4,5,9,11)
3. 03-collaboration.sql → trebalo bi: INSERT 0 20 (svi importeri 6,7,10,12 vide proizvode)
4. 04-container.sql  → trebalo bi: INSERT 0 6
5. 05-container-item.sql → trebalo bi: 7× INSERT 0 1

Napomena: 02 koristi categoryId 1=Electronics, 2=Clothing, 3=Food. Ako ti Category već ima druge ID-jeve, u pgAdminu pokreni:
  SELECT id, name FROM "Category";
pa u 02-product.sql zameni 1,2,3 sa pravim ID-jevima.
