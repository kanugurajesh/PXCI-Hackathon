import { UserButton } from "@clerk/nextjs";
import Form from "./Form";

import { prisma } from "@/prisma/client";
import { inngest } from "@/inngest";

export async function create(message: string, userId: string) {
  "use server";
  if (!userId) {
    throw new Error("You must be signed in to create messages!");
  }
  const createdMessage = await prisma.messages.create({
    data: { text: message, author: userId },
  });

  await inngest.send({
    name: "app/message.sent",
    data: {
      messageId: createdMessage.xata_id,
    },
  });
}

export default async function DashboardPage() {
  const message = await prisma.messages.findFirst({
    orderBy: { xata_createdat: "desc" },
  });
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex w-2/3 justify-end pr-12">
        <UserButton />
      </div>
      <Form create={create} latestMessage={message} />
    </main>
  );
}
