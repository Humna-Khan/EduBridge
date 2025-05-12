"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Loader2, Search, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getUserConversations, getUserGroups } from "@/lib/actions/message-actions"

interface ContactsListProps {
  userId: string
  activeContactId?: string
  activeGroupId?: string
}

export function ContactsList({ userId, activeContactId, activeGroupId }: ContactsListProps) {
  const { toast } = useToast()
  const [conversations, setConversations] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch conversations
        const conversationsResult = await getUserConversations(userId)
        if (conversationsResult.conversations) {
          setConversations(conversationsResult.conversations)
        } else if (conversationsResult.error) {
          toast({
            title: "Error",
            description: conversationsResult.error,
            variant: "destructive",
          })
        }

        // Fetch groups
        const groupsResult = await getUserGroups(userId)
        if (groupsResult.groups) {
          setGroups(groupsResult.groups)
        } else if (groupsResult.error) {
          toast({
            title: "Error",
            description: groupsResult.error,
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch contacts",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, toast])

  // Filter conversations and groups based on search query
  const filteredConversations = conversations.filter((conv) =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredGroups = groups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Card className="h-[calc(100vh-12rem)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Messages</CardTitle>
            <CardDescription>Your conversations and groups</CardDescription>
          </div>
          <Button asChild size="sm">
            <Link href="/dashboard/messages/new-group">
              <Users className="mr-2 h-4 w-4" />
              New Group
            </Link>
          </Button>
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts and groups..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-8rem)] overflow-y-auto p-0">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredConversations.length === 0 && filteredGroups.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-4 text-center">
            <Users className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchQuery ? "No contacts or groups match your search" : "No conversations yet"}
            </p>
          </div>
        ) : (
          <div>
            {filteredGroups.length > 0 && (
              <div className="mb-2">
                <h3 className="px-4 py-2 text-sm font-medium text-muted-foreground">Groups</h3>
                <div>
                  {filteredGroups.map((group) => (
                    <Link key={group.id} href={`/dashboard/messages/groups/${group.id}`} className="block">
                      <div
                        className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted ${
                          activeGroupId === group.id ? "bg-muted" : ""
                        }`}
                      >
                        <Avatar>
                          <AvatarFallback className="bg-blue-100 text-blue-800">
                            {getInitials(group.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">{group.name}</h4>
                            {group.messages.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(group.messages[0].createdAt), "h:mm a")}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground truncate">{group._count.members} members</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {filteredConversations.length > 0 && (
              <div>
                <h3 className="px-4 py-2 text-sm font-medium text-muted-foreground">Direct Messages</h3>
                <div>
                  {filteredConversations.map((conv) => (
                    <Link key={conv.user.id} href={`/dashboard/messages/users/${conv.user.id}`} className="block">
                      <div
                        className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted ${
                          activeContactId === conv.user.id ? "bg-muted" : ""
                        }`}
                      >
                        <Avatar>
                          <AvatarImage src={conv.user.image || "/placeholder.svg"} alt={conv.user.name} />
                          <AvatarFallback>{getInitials(conv.user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">{conv.user.name}</h4>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(conv.lastMessage.createdAt), "h:mm a")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.lastMessage.content.length > 30
                                ? `${conv.lastMessage.content.substring(0, 30)}...`
                                : conv.lastMessage.content}
                            </p>
                            {conv.unreadCount > 0 && (
                              <Badge className="ml-auto h-5 w-5 rounded-full p-0 text-center">{conv.unreadCount}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
