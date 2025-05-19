import { AccountType } from "@/app/types/account-types";
import { NextRequest, NextResponse } from "next/server";
import LoginService from "@/services/login";

async function GET(request: NextRequest): Promise<NextResponse> {
    // TODO: This will need to be refactored to support Apple Music
    const token = request.cookies.get('spotify_token')?.value;
    if (!token) return NextResponse.json({ message: 'No token found' }, { status: 401 });

    const accountId = request.nextUrl.searchParams.get('accountId');
    if (!accountId) return NextResponse.json({ message: 'No account id found' }, { status: 400 });

    const accountType = request.nextUrl.searchParams.get('accountType');
    if (!accountType) return NextResponse.json({ message: 'No account type found' }, { status: 400 });

    if(accountType !== AccountType.SPOTIFY) return NextResponse.json({ message: 'Unsupported account type' }, { status: 400 });

    const userId = await LoginService.loginUser(accountId, AccountType.SPOTIFY);

    const response = new NextResponse();

    response.cookies.set('userId', userId.toString(), {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
    });
    
    return response;
}

export { GET };
