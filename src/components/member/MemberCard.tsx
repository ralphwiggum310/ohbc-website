'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Member } from '@/types/member';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Mail, Phone, Home, Users } from 'lucide-react';

export default function MemberCard({ member }: { member: Member }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const primaryMember = member.members.find(m => m.isPrimary) || member.members[0];

  return (
    <Card className="w-full overflow-hidden transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-start space-x-4">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
            {member.photoUrl ? (
              <Image
                src={member.photoUrl}
                alt={`${member.familyName} family`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
                <Users className="h-8 w-8" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{member.familyName} Family</CardTitle>
            <div className="mt-1 flex items-center text-sm text-gray-600">
              <Home className="mr-1 h-4 w-4" />
              <span>{member.address.street}, {member.address.city}, {member.address.state} {member.address.zip}</span>
            </div>
            <div className="mt-1 flex items-center text-sm text-gray-600">
              <Phone className="mr-1 h-4 w-4" />
              <span>{member.phone}</span>
            </div>
            {primaryMember?.email && (
              <div className="mt-1 flex items-center text-sm text-gray-600">
                <Mail className="mr-1 h-4 w-4" />
                <a href={`mailto:${primaryMember.email}`} className="hover:underline">
                  {primaryMember.email}
                </a>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="border-t pt-4">
          <h4 className="mb-3 font-medium">Family Members</h4>
          <div className="space-y-3">
            {member.members.map((person) => (
              <div key={person.id} className="flex items-start rounded-lg bg-gray-50 p-3">
                <div className="flex-1">
                  <div className="font-medium">
                    {person.firstName} {person.lastName}{' '}
                    {person.isPrimary && <span className="ml-1 text-xs text-blue-600">(Primary)</span>}
                  </div>
                  <div className="text-sm text-gray-600">{person.relationship}</div>
                  {person.phone && (
                    <div className="mt-1 flex items-center text-sm">
                      <Phone className="mr-1 h-3.5 w-3.5 text-gray-500" />
                      <a href={`tel:${person.phone}`} className="hover:underline">
                        {person.phone}
                      </a>
                    </div>
                  )}
                  {person.email && (
                    <div className="mt-1 flex items-center text-sm">
                      <Mail className="mr-1 h-3.5 w-3.5 text-gray-500" />
                      <a href={`mailto:${person.email}`} className="hover:underline">
                        {person.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
