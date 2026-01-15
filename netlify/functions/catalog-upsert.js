
import postgres from 'postgres';

const sql = postgres(process.env.NEON_DATABASE_URL, { ssl: 'require' });

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const {
      id,
      category,
      title,
      description,
      price,
      image_url,
      cloudinary_public_id,
      features
    } = data;

    let result;
    if (id) {
      // Update
      result = await sql`
        UPDATE catalog_items SET
          category = ${category},
          title = ${title},
          description = ${description},
          price = ${price},
          image_url = ${image_url},
          cloudinary_public_id = ${cloudinary_public_id},
          features = ${features},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
    } else {
      // Insert
      result = await sql`
        INSERT INTO catalog_items (
          category, title, description, price, 
          image_url, cloudinary_public_id, features, is_active
        ) VALUES (
          ${category}, ${title}, ${description}, ${price}, 
          ${image_url}, ${cloudinary_public_id}, ${features}, true
        )
        RETURNING *
      `;
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result[0])
    };

  } catch (error) {
    console.error('Catalog Upsert Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
