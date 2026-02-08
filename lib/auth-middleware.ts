import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload } from './auth';

export interface AuthenticatedRequest extends NextRequest {
    user?: JWTPayload;
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function requireAuth(
    request: NextRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
        return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
        );
    }

    const user = verifyToken(token);

    if (!user) {
        return NextResponse.json(
            { error: 'Invalid or expired token' },
            { status: 401 }
        );
    }

    // Attach user to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = user;

    return handler(authenticatedRequest);
}

/**
 * Middleware to verify user has officer role
 */
export async function requireOfficer(
    request: NextRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
    return requireAuth(request, async (req) => {
        if (req.user?.role !== 'officer') {
            return NextResponse.json(
                { error: 'Officer role required' },
                { status: 403 }
            );
        }
        return handler(req);
    });
}
