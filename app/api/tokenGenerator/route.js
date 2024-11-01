import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const secret = process.env.GET_STREAM_SECRET;

export async function POST(request) {
    try {
        // Check if the request has a body
        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return NextResponse.json({ 
                error: 'Invalid content type. Must be application/json' 
            }, { status: 400 });
        }

        // Safely parse the JSON body
        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            return NextResponse.json({ 
                error: 'Invalid JSON in request body',
                details: parseError.message 
            }, { status: 400 });
        }

        // Extract userId
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ 
                error: 'User ID is required' 
            }, { status: 400 });
        }

        // Create a token
        const token = jwt.sign({ user_id: userId }, secret, {
            algorithm: 'HS256',
            expiresIn: '1h', // Token expiration time
        });

        return NextResponse.json({ token });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error.message 
        }, { status: 500 });
    }
}